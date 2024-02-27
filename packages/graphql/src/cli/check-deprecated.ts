import fs from 'fs/promises';
import { ASTVisitor, buildSchema, ConstDirectiveNode, Kind, parse, TypeInfo, visit, visitWithTypeInfo } from 'graphql';
import { extractQueryList } from './common';

function isDeprecated(directives: readonly ConstDirectiveNode[] | undefined) {
  for (const directive of directives || []) {
    if (directive.name.value === 'deprecated') {
      return true;
    }
  }
  return false;
}

async function check(schema_file: string, query_list_file: string) {
  const schema = buildSchema(await fs.readFile(schema_file, 'utf-8'));
  const query_list = extractQueryList(await fs.readFile(query_list_file, 'utf-8'));
  for (const query of query_list) {
    if (!query) {
      continue;
    }
    console.log(`=`.repeat(120));
    console.log(query);
    console.log(`-`.repeat(80));

    const parsed_query = parse(query);
    const type_info = new TypeInfo(schema);
    let has_deprecated;

    has_deprecated = false;
    const visitor: ASTVisitor = {
      enter(node) {
        if (node.kind === Kind.FIELD) {
          const type = type_info.getParentType();
          const field = type_info.getFieldDef();
          if (type && field) {
            const is_field_deprecated = isDeprecated(field.astNode?.directives);
            if (is_field_deprecated) {
              has_deprecated = true;
              console.log(`${type.name}.${field.name} is deprecated`);
            }
            if (node.arguments) {
              for (const argument of node.arguments) {
                const field_arg = field.args.find((arg) => arg.name === argument.name.value);
                if (field_arg) {
                  const is_arg_deprecated = isDeprecated(field_arg.astNode?.directives);
                  if (is_arg_deprecated) {
                    has_deprecated = true;
                    console.log(`${type.name}.${field.name}(${field_arg.name}) is deprecated`);
                  }
                }
              }
            }
          }
        }
      },
    };

    visit(parsed_query, visitWithTypeInfo(type_info, visitor));

    if (!has_deprecated) {
      console.log('No deprecated fields found');
    }
    console.log('\n');
  }
  return schema;
}

export async function run(argv: string[]) {
  if (argv.length < 4) {
    throw new Error('Usage: check-deprecated <schema file> <query list>');
  }
  const schema_file = argv[2];
  const query_list_file = argv[3];

  await check(schema_file, query_list_file);
}
