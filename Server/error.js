export class ServerError extends Error { 
    constructor(message,errorcode=0){
        super(message)
        this.errorcode=errorcode
    };
}