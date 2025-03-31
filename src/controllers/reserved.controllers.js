import Reserves from "../models/reserved.model.js";

/* let waitingClients = [];
let lastReservesUpdate = null; */

export const createReserved = async (req, res) => {
  try {
    const { date, time, service, status, payment_status, adress } = req.body;
    const newReserved = new Reserves({
        date,
        time,
        service,
        status,
        payment_status,
        adress,
        user: req.user.id,
    });
    await newReserved.save();
   /*  notifyReservesUpdate(); */
    return res.status(201).json({
      reserve: newReserved,
      message: [`Gracias, tu reserva ha sido creada correctamente`],
      success: true
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const getReserved = async (req, res) => {
  try {
    const reserved = await Reserves.findById(req.params.id);
    if (!reserved) return res.status(404).json({ message: "Reservation not found" });
    return res.json(reserved);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getReservesUser = async (req, res) => {
  try {
    const { idUser } = req.params; 
    if (!idUser) {
      return res.status(400).json({ message: "El ID del usuario es requerido" });
    }
    const reservesUser = await Reserves.find({ user : idUser }).populate("user");
    res.json(reservesUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getReservedDates = async (req, res) => {
  try {
    const reservations = await Reserves.find({}, 'date hours'); 
    const formattedReservations = reservations.map(reserve => ({
      date: reserve.date, 
      hours: reserve.hours
    }));
    return res.status(200).json(formattedReservations);
  } catch (error) {
    console.error('Error al obtener fechas reservadas:', error);
    return res.status(500).json({ message: 'Error al obtener las fechas reservadas', error: error.message });
  }
};
