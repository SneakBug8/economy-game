export interface DBEntry {
    GetByID(id:number) : Promise<DBEntry>;
    Delete(id:number) : Promise<void>;
    Exists(id:number) : Promise<boolean>;
    From(dbobject:any) : Promise<DBEntry>;
}