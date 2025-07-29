class ApiError extends Error {
    constructor(
        statusCode,
        message="something went wrong",
        errors=[]
    ) {
        super(message)
        this.statusCode=statusCode
        this.errors=errors
        this.success=false
    }
}

module.exports=ApiError