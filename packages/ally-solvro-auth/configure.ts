/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */
import assert from "node:assert";

import { CodeTransformer } from "@adonisjs/assembler/code_transformer";
import type Configure from "@adonisjs/core/commands/configure";

import { stubsRoot } from "./stubs/main.js";

type CodeTransformerProject = CodeTransformer["project"];

type SourceFile = ReturnType<CodeTransformerProject["createSourceFile"]>;

function addImportIfNotExists(
  sourceFile: SourceFile,
  importPath: string,
  importName: string,
) {
  const existingImports = sourceFile.getImportDeclarations();
  const hasImport = existingImports.some(
    (imp) =>
      imp.getModuleSpecifierValue() === importPath &&
      imp.getNamedImports().some((named) => named.getName() === importName),
  );

  if (!hasImport) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: importPath,
      namedImports: [{ name: importName }],
    });
  }
}

function addControllerImportIfNotExists(sourceFile: SourceFile) {
  const existingVariables = sourceFile.getVariableDeclarations();
  const hasControllerImport = existingVariables.some((imp) =>
    imp.getText().includes("AuthController"),
  );

  if (!hasControllerImport) {
    sourceFile.addVariableStatement({
      declarations: [
        {
          name: "AuthController",
          initializer: '() => import("#controllers/auth_controller")',
        },
      ],
    });
  }
}

function addNewRoutes(sourceFile: SourceFile) {
  // Find the last router statement
  const routerStatements = sourceFile
    // @ts-expect-error ??
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    // @ts-expect-error ??
    .filter((call) => call.getExpression().getText().startsWith("router."));

  const lastRouterStatement = routerStatements[routerStatements.length - 1];

  // Add new routes after the last existing route
  const newRoutes = `
router.get("/auth/login", [AuthController, "login"]).use(middleware.guest());
router.get("/auth/callback", [AuthController, "callback"]).use(middleware.guest());
router.post("/auth/logout", [AuthController, "logout"]).use(middleware.auth());
`;
  if (lastRouterStatement) {
    sourceFile.insertText(lastRouterStatement.getEnd() + 1, newRoutes);
  } else {
    sourceFile.addStatements(newRoutes);
  }
}

export async function configure(command: Configure) {
  const codemods = await command.createCodemods();

  codemods.overwriteExisting = true;

  command.logger.info("Konfiguracja @solvro/auth");
  command.logger.info(
    "Żeby dostać CLIENT_ID i CLIENT_SECRET, zapytaj na #main i zpinguj @Bartosz Gotowski 😍",
  );

  const clientId = await command.prompt.ask("Jaki masz CLIENT_ID? ", {
    hint: "web-planer",
  });
  const clientSecret = await command.prompt.ask("Jaki masz CLIENT_SECRET? ", {
    hint: "a17c54tH8AmWC0yq7FSQbNpPp8wELqeN",
  });

  await codemods.makeUsingStub(
    stubsRoot,
    "controllers/auth_controller.stub",
    {},
  );
  await codemods.makeUsingStub(stubsRoot, "config/ally.stub", {});

  await codemods.defineEnvVariables({
    APP_DOMAIN: "http://localhost:3333",
    SOLVRO_AUTH_CLIENT_ID: clientId,
    SOLVRO_AUTH_CLIENT_SECRET: clientSecret,
  });

  await codemods.defineEnvValidations({
    variables: {
      APP_DOMAIN: `Env.schema.string()`,
      SOLVRO_AUTH_CLIENT_ID: "Env.schema.string()",
      SOLVRO_AUTH_CLIENT_SECRET: "Env.schema.string()",
    },
    leadingComment: "Variables for @solvro/auth",
  });

  const project = await codemods.getTsMorphProject();
  assert(project);

  const file = project?.getSourceFileOrThrow("start/routes.ts");

  addImportIfNotExists(file, "./kernel.js", "middleware");
  addControllerImportIfNotExists(file);
  addNewRoutes(file);

  await file.save();
}
