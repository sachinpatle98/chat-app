import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getAllContacts, getContactsForDMList, SearchContacts } from "../controllers/ContactController.js";



const contactRoutes = Router();

contactRoutes.post('/search', verifyToken, SearchContacts);
contactRoutes.get('/get-contacts-for-dm', verifyToken, getContactsForDMList);
contactRoutes.get('/get-all-contacts', verifyToken, getAllContacts);

export default contactRoutes;