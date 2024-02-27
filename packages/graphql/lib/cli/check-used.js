"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const graphql_1 = require("graphql");
const common_1 = require("./common");
function isDeprecated(directives) {
    for (const directive of directives || []) {
        if (directive.name.value === 'deprecated') {
            return true;
        }
    }
    return false;
}
async function check(schema_file, query_list_file) {
    const schema = (0, graphql_1.buildSchema)(await promises_1.default.readFile(schema_file, 'utf-8'));
    const query_list = (await promises_1.default.readFile(query_list_file, 'utf-8')).split('\n');
    for (const query of query_list) {
        if (!query) {
            continue;
        }
        const parsed_query = (0, graphql_1.parse)(query);
        const type_info = new graphql_1.TypeInfo(schema);
        const visitor = {
            enter(node) {
                if (node.kind === graphql_1.Kind.NAMED_TYPE) {
                    const name = node.name.value;
                    const type = schema.getType(name);
                    if (type) {
                        type.extensions = {
                            used: true,
                            query_list: [...(type.extensions.query_list || []), query],
                        };
                    }
                }
                if (node.kind === graphql_1.Kind.FIELD) {
                    const field = type_info.getFieldDef();
                    if (field) {
                        field.extensions = {
                            used: true,
                            query_list: [...(field.extensions.query_list || []), query],
                        };
                        if (node.arguments) {
                            for (const argument of node.arguments) {
                                const field_arg = field.args.find((arg) => arg.name === argument.name.value);
                                if (field_arg) {
                                    field_arg.extensions = {
                                        used: true,
                                        query_list: [...(field_arg.extensions.query_list || []), query],
                                    };
                                }
                            }
                        }
                    }
                }
            },
        };
        (0, graphql_1.visit)(parsed_query, (0, graphql_1.visitWithTypeInfo)(type_info, visitor));
    }
    return schema;
}
function showAll(schema) {
    const types = Object.values(schema.getTypeMap());
    for (const type of types) {
        if (type.name.startsWith('__')) {
            continue;
        }
        if ((0, graphql_1.isInputObjectType)(type) || (0, graphql_1.isObjectType)(type)) {
            showType(type);
        }
    }
}
function showType(type) {
    const type_str = (0, graphql_1.isInputObjectType)(type) ? 'input' : 'type';
    const has_used_field = Object.values(type.getFields()).some((field) => field.extensions.used);
    const is_type_deprecated = isDeprecated(type.astNode?.directives);
    let type_status = '';
    if (type.extensions.used) {
        type_status = is_type_deprecated
            ? `${common_1.COLORS.RED}used(deprecated)${common_1.COLORS.RESET}`
            : `${common_1.COLORS.GREEN}used${common_1.COLORS.RESET}`;
    }
    else {
        if (has_used_field) {
            type_status = is_type_deprecated
                ? `${common_1.COLORS.RED}no reference(deprecated)${common_1.COLORS.RESET}`
                : `${common_1.COLORS.BLUE}no reference${common_1.COLORS.RESET}`;
        }
        else {
            type_status = is_type_deprecated
                ? `${common_1.COLORS.RED}never(deprecated)${common_1.COLORS.RESET}`
                : `${common_1.COLORS.RED}never${common_1.COLORS.RESET}`;
        }
    }
    console.log(`${type_str} ${type.name}: ${type_status}`);
    for (const field of Object.values(type.getFields())) {
        const is_field_deprecated = isDeprecated(field.astNode?.directives);
        let field_status = '';
        if (field.extensions.used) {
            field_status = is_field_deprecated
                ? `${common_1.COLORS.RED}used(deprecated)${common_1.COLORS.RESET}`
                : `${common_1.COLORS.GREEN}used${common_1.COLORS.RESET}`;
        }
        else {
            field_status = is_field_deprecated
                ? `${common_1.COLORS.RED}never(deprecated)${common_1.COLORS.RESET}`
                : `${common_1.COLORS.RED}never${common_1.COLORS.RESET}`;
        }
        console.log(`  ${type.name}.${field.name}: ${field_status}`);
        if ('args' in field) {
            for (const arg of field.args) {
                const is_arg_deprecated = isDeprecated(arg.astNode?.directives);
                let arg_status = '';
                if (arg.extensions.used) {
                    arg_status = is_arg_deprecated
                        ? `${common_1.COLORS.RED}used(deprecated)${common_1.COLORS.RESET}`
                        : `${common_1.COLORS.GREEN}used${common_1.COLORS.RESET}`;
                }
                else {
                    arg_status = is_arg_deprecated
                        ? `${common_1.COLORS.RED}never(deprecated)${common_1.COLORS.RESET}`
                        : `${common_1.COLORS.RED}never${common_1.COLORS.RESET}`;
                }
                console.log(`    (${arg.name}): ${arg_status}`);
            }
        }
    }
}
function showOfTypeOrField(schema, type_or_field) {
    const types = Object.values(schema.getTypeMap());
    for (const type of types) {
        if (!((0, graphql_1.isInputObjectType)(type) || (0, graphql_1.isObjectType)(type))) {
            continue;
        }
        if (type.name === type_or_field) {
            showType(type);
            const query_list = [];
            for (const field of Object.values(type.getFields())) {
                query_list.push(...(field.extensions.query_list || []));
            }
            showQueryList(query_list);
        }
        if (type_or_field.startsWith(`${type.name}.`)) {
            showType(type);
            const field_name = type_or_field.split('.')[1];
            const field = type.getFields()[field_name];
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (field) {
                const query_list = field.extensions.query_list || [];
                showQueryList(query_list);
            }
        }
    }
}
function showQueryList(query_list) {
    const unique_query_list = [...new Set(query_list)];
    console.log(`Used by ${unique_query_list.length} queries`);
    for (const query of unique_query_list) {
        showQuery(query);
    }
}
function showQuery(query) {
    console.log('-'.repeat(120));
    console.log((0, graphql_1.print)((0, graphql_1.parse)(query)));
}
async function run(argv) {
    if (argv.length < 4) {
        throw new Error('Usage: check-used <schema file> <query list> [type or field]');
    }
    const schema_file = argv[2];
    const query_list_file = argv[3];
    const schema = await check(schema_file, query_list_file);
    if (argv.length === 4) {
        showAll(schema);
    }
    else {
        showOfTypeOrField(schema, argv[4]);
    }
}
exports.run = run;
