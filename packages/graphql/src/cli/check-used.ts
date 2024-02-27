import fs from 'fs/promises';
import {
  ASTVisitor,
  ConstDirectiveNode,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLSchema,
  Kind,
  TypeInfo,
  buildSchema,
  isInputObjectType,
  isObjectType,
  parse,
  print,
  visit,
  visitWithTypeInfo,
} from 'graphql';
import { COLORS } from './common';

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
  const query_list = (await fs.readFile(query_list_file, 'utf-8')).split('\n');
  for (const query of query_list) {
    if (!query) {
      continue;
    }
    const parsed_query = parse(query);
    const type_info = new TypeInfo(schema);
    const visitor: ASTVisitor = {
      enter(node) {
        if (node.kind === Kind.NAMED_TYPE) {
          const name = node.name.value;
          const type = schema.getType(name);
          if (type) {
            type.extensions = {
              used: true,
              query_list: [...((type.extensions.query_list as string[] | undefined) || []), query],
            };
          }
        }
        if (node.kind === Kind.FIELD) {
          const field = type_info.getFieldDef();
          if (field) {
            field.extensions = {
              used: true,
              query_list: [...((field.extensions.query_list as string[] | undefined) || []), query],
            };
            if (node.arguments) {
              for (const argument of node.arguments) {
                const field_arg = field.args.find((arg) => arg.name === argument.name.value);
                if (field_arg) {
                  field_arg.extensions = {
                    used: true,
                    query_list: [...((field_arg.extensions.query_list as string[] | undefined) || []), query],
                  };
                }
              }
            }
          }
        }
      },
    };
    visit(parsed_query, visitWithTypeInfo(type_info, visitor));
  }
  return schema;
}

function showAll(schema: GraphQLSchema) {
  const types = Object.values(schema.getTypeMap());
  for (const type of types) {
    if (type.name.startsWith('__')) {
      continue;
    }
    if (isInputObjectType(type) || isObjectType(type)) {
      showType(type);
    }
  }
}

function showType(type: GraphQLInputObjectType | GraphQLObjectType) {
  const type_str = isInputObjectType(type) ? 'input' : 'type';
  const has_used_field = Object.values(type.getFields()).some((field) => field.extensions.used);
  const is_type_deprecated = isDeprecated(type.astNode?.directives);
  let type_status = '';
  if (type.extensions.used) {
    type_status = is_type_deprecated
      ? `${COLORS.RED}used(deprecated)${COLORS.RESET}`
      : `${COLORS.GREEN}used${COLORS.RESET}`;
  } else {
    if (has_used_field) {
      type_status = is_type_deprecated
        ? `${COLORS.RED}no reference(deprecated)${COLORS.RESET}`
        : `${COLORS.BLUE}no reference${COLORS.RESET}`;
    } else {
      type_status = is_type_deprecated
        ? `${COLORS.RED}never(deprecated)${COLORS.RESET}`
        : `${COLORS.RED}never${COLORS.RESET}`;
    }
  }
  console.log(`${type_str} ${type.name}: ${type_status}`);
  for (const field of Object.values(type.getFields())) {
    const is_field_deprecated = isDeprecated(field.astNode?.directives);
    let field_status = '';
    if (field.extensions.used) {
      field_status = is_field_deprecated
        ? `${COLORS.RED}used(deprecated)${COLORS.RESET}`
        : `${COLORS.GREEN}used${COLORS.RESET}`;
    } else {
      field_status = is_field_deprecated
        ? `${COLORS.RED}never(deprecated)${COLORS.RESET}`
        : `${COLORS.RED}never${COLORS.RESET}`;
    }
    console.log(`  ${type.name}.${field.name}: ${field_status}`);
    if ('args' in field) {
      for (const arg of field.args) {
        const is_arg_deprecated = isDeprecated(arg.astNode?.directives);
        let arg_status = '';
        if (arg.extensions.used) {
          arg_status = is_arg_deprecated
            ? `${COLORS.RED}used(deprecated)${COLORS.RESET}`
            : `${COLORS.GREEN}used${COLORS.RESET}`;
        } else {
          arg_status = is_arg_deprecated
            ? `${COLORS.RED}never(deprecated)${COLORS.RESET}`
            : `${COLORS.RED}never${COLORS.RESET}`;
        }
        console.log(`    (${arg.name}): ${arg_status}`);
      }
    }
  }
}

function showOfTypeOrField(schema: GraphQLSchema, type_or_field: string) {
  const types = Object.values(schema.getTypeMap());
  for (const type of types) {
    if (!(isInputObjectType(type) || isObjectType(type))) {
      continue;
    }
    if (type.name === type_or_field) {
      showType(type);
      const query_list: string[] = [];
      for (const field of Object.values(type.getFields())) {
        query_list.push(...((field.extensions.query_list as string[] | undefined) || []));
      }
      showQueryList(query_list);
    }
    if (type_or_field.startsWith(`${type.name}.`)) {
      showType(type);
      const field_name = type_or_field.split('.')[1];
      const field = type.getFields()[field_name];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (field) {
        const query_list = (field.extensions.query_list as string[] | undefined) || [];
        showQueryList(query_list);
      }
    }
  }
}

function showQueryList(query_list: string[]) {
  const unique_query_list = [...new Set(query_list)];
  console.log(`Used by ${unique_query_list.length} queries`);
  for (const query of unique_query_list) {
    showQuery(query);
  }
}

function showQuery(query: string) {
  console.log('-'.repeat(120));
  console.log(print(parse(query)));
}

export async function run(argv: string[]) {
  if (argv.length < 4) {
    throw new Error('Usage: check-used <schema file> <query list> [type or field]');
  }
  const schema_file = argv[2];
  const query_list_file = argv[3];

  const schema = await check(schema_file, query_list_file);

  if (argv.length === 4) {
    showAll(schema);
  } else {
    showOfTypeOrField(schema, argv[4]);
  }
}
