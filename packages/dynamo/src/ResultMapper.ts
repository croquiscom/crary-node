import * as _ from 'lodash';
import { QueryResult } from './Types';

const DateFields = ['date_created', 'date_updated', 'dateCreated', 'dateUpdated', 'locked_at', 'start_time', 'end_time'];

export class ResultMapper {
  static mapQueryResultItems<T>(result): T[] {
    let items: T[] = [];
    if (result.Items) {
      items = _.map<any, T>(result.Items, (item) => this.mapItem(item));
    }

    return items;
  }

  static mapQueryResult<T>(result): QueryResult<T> {
    const output: QueryResult<T> = { count: 0, items: [], nextCursor: undefined };
    if (result.Items) {
      output.items = _.map<any, T>(result.Items, (item) => this.mapItem(item));
    }
    if (result.Count) {
      output.count = result.Count;
    }
    if (result.LastEvaluatedKey) {
      output.nextCursor = JSON.stringify(result.LastEvaluatedKey);
    } else {
      delete output.nextCursor;
    }

    return output;
  }

  static mapQueryCount(result): number {
    return result.Count;
  }

  static mapItem<T>(result): T {
    if (result) {
      return this.convertDateFileds(result.toJSON());
    } else {
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
      } else if (typeof data[key] === 'object') {
        data[key] = this.convertDateFileds(data[key]);
      }
    }
    return data;
  }
}
