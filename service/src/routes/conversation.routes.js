
import { Router } from "express";

import {
    postConversation,
    listConversations,
    detailConversation,
    removeConversation
} from "../controllers/conversation.controller.js";

const router = Router();

router.post("/", postConversation);
router.get("/", listConversations);
router.get("/:id/messages", detailConversation);
router.delete("/:id", removeConversation);

export default router;
