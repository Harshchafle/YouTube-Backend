
// const asyncHandler = () => {}
// const asyncHandler = (fn) => {}
// const asyncHandler = (fn) => async() => {}

// 1. Using try - catch
// const asyncHandler = (fn) => async(err, req, res, next) => {
//     try{
//         await fn(err, req, res, next)
//     }
//     catch(err){
//         res.status(err.code || 300).json({
//             success : false,
//             message : err.message
//         })
//     }
// }

// 2. Using Promises
const asyncHandler = (reqHandlder) => {
    (err, req, res, next) => {
        Promise.resolve(reqHandlder(err, req, res, next))
        .catch((err) => next(err))
    }
}