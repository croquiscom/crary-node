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
    const query_list = (0, common_1.extractQueryList)(await promises_1.default.readFile(query_list_file, 'utf-8'));
    for (const query of query_list) {
        if (!query) {
            continue;
        }
        console.log(`=`.repeat(120));
        console.log(query);
        console.log(`-`.repeat(80));
        const parsed_query = (0, graphql_1.parse)(query);
        const type_info = new graphql_1.TypeInfo(schema);
        let has_deprecated;
        has_deprecated = false;
        const visitor = {
            enter(node) {
                if (node.kind === graphql_1.Kind.FIELD) {
                    const type = type_info.getParentType();
                    const field = type_info.getFieldDef();
                    if (type && field) {
                        const is_field_deprecated = isDeprecated(field.astNode?.directives);
                        if (is_field_deprecated) {
                            has_deprecated = true;
                            console.log(`${common_1.COLORS.RED}${type.name}.${field.name} is deprecated${common_1.COLORS.RESET}`);
                        }
                        if (node.arguments) {
                            for (const argument of node.arguments) {
                                const field_arg = field.args.find((arg) => arg.name === argument.name.value);
                                if (field_arg) {
                                    const is_arg_deprecated = isDeprecated(field_arg.astNode?.directives);
                                    if (is_arg_deprecated) {
                                        has_deprecated = true;
                                        console.log(`${common_1.COLORS.RED}${type.name}.${field.name}(${field_arg.name}) is deprecated${common_1.COLORS.RESET}`);
                                    }
                                }
                            }
                        }
                    }
                }
            },
        };
        (0, graphql_1.visit)(parsed_query, (0, graphql_1.visitWithTypeInfo)(type_info, visitor));
        if (!has_deprecated) {
            console.log('No deprecated fields found');
        }
        console.log('\n');
    }
    return schema;
}
async function run(argv) {
    if (argv.length < 4) {
        throw new Error('Usage: check-deprecated <schema file> <query list>');
    }
    const schema_file = argv[2];
    const query_list_file = argv[3];
    await check(schema_file, query_list_file);
}
exports.run = run;
