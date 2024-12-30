class ApiResponses{
    constructor(
        statusCode,
        data,
        message="Succcess"
    ){
        this.statusCode = statusCode
        this.message = message
        this.data = data
        this.success = statusCode < 400
    }
}