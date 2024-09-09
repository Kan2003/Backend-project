import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.Middleware.js";
import { addComment, deleteComment, getComments, updateComment } from "../contollers/comment.controller.js";



const router = Router();
router.use(verifyJwt);



router.route('/:videoId')
        .post(addComment)
        .get(getComments)



router.route('/c/:commentId')
        .patch(updateComment)
        .delete(deleteComment)
        


export default router