import { QueryResult } from './Types';
export declare class ResultMapper {
    static mapQueryResultItems<T>(result: any): T[];
    static mapQueryResult<T>(result: any): QueryResult<T>;
    static mapQueryCount(result: any): number;
    static mapItem<T>(result: any): T;
    /**
     * Create operation일 경우 결과를 origin object를 반환하지만,
     * db에서 가져온 데이터는 date로 다시 변환이 안되기에때문에, 일단 이 함수를 통해서 변환.
     * 추후에 dynogels를 수정하던지 한다. 타겟..(see. DateFields)
     */
    static convertDateFileds(data: any): any;
}
