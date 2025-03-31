import { Router } from "express";
import {
  createReserved,
  getReserved,
  getReservesUser,
  getReservedDates,
} from "../controllers/reserved.controllers.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();


router.post("/createreservation", auth, createReserved);

router.get("/reserve/view/:id", auth, getReserved);

router.get("/reserves/:idUser", auth, getReservesUser);

router.get("/reservations/dates", auth, getReservedDates);

/* router.get('/reservations/dates/poll', longPoll); */



export default router;