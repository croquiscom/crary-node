"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
const DateFields = ['date_created', 'date_updated', 'dateCreated', 'dateUpdated', 'locked_at', 'start_time', 'end_time'];
class ResultMapper {
    static mapQueryResultItems(result) {
        let items = [];
        if (result.Items) {
            items = _.map(result.Items, (item) => this.mapItem(item));
        }
        return items;
    }
    static mapQueryResult(result) {
        const output = { count: 0, items: [], nextCursor: undefined };
        if (result.Items) {
            output.items = _.map(result.Items, (item) => this.mapItem(item));
        }
        if (result.Count) {
            output.count = result.Count;
        }
        if (result.LastEvaluatedKey) {
            output.nextCursor = JSON.stringify(result.LastEvaluatedKey);
        }
        else {
            delete output.nextCursor;
        }
        return output;
    }
    static mapQueryCount(result) {
        return result.Count;
    }
    static mapItem(result) {
        if (result) {
            return this.convertDateFileds(result.toJSON());
        }
        else {
            return result;
        }
    }
    /**
     * Create operation일 경우 결과를 origin object를 반환하지만,
     * db에서 가져온 데이터는 date로 다시 변환이 안되기에때문에, 일단 이 함수를 통해서 변환.
     * 추후에 dynogels를 수정하던지 한다. 타겟..(see. DateFields)
     */
    static convertDateFileds(data) {
        for (const key of _.keys(data)) {
            if (typeof data[key] === 'string') {
                if (DateFields.indexOf(key) >= 0) {
                    data[key] = new Date(data[key]);
                }
            }
            else if (typeof data[key] === 'object') {
                data[key] = this.convertDateFileds(data[key]);
            }
        }
        return data;
    }
}
exports.ResultMapper = ResultMapper;
