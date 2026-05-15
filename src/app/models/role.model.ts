export class RoleModel {
    id: number;
    description: string;
    function: string;
    id_status: number;
    // status: StatusModel;
    constructor() {
        this.id = 0;
        this.description = "";
        this.function = "";
        this.id_status = 1;
    }
}