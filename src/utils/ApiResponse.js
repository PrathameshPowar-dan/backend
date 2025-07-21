class ApiResponse{
    constructor(statusCode,data,message="SUCCESS!!!"){
        this.statusCode=statusCode
        this.message = message
        this.data = data
        this.success =  true
    }
}

export {ApiResponse}