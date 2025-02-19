const {Queue} = require('bullmq');
const redis = require('../utils/redisclient'); 
const Menu = require('../models/menu');
const { invalidateCache,cacheData, getCachedData, } = require('../utils/redisclient'); 
const addMenuItem = async (req, res) => {
  try {
    const { mealType, date, items } = req.body;
    if (!mealType || !date || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields: mealType, date, or items array" });
    }
    if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
      return res.status(400).json({ message: "Invalid meal type. Choose 'breakfast', 'lunch', or 'dinner'." });
    }
    const menuDate = new Date(date.split('/').reverse().join('-')); 
    menuDate.setHours(0, 0, 0, 0); 
    if (isNaN(menuDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format. Please provide a valid date (DD/MM/YYYY)." });
    }
    let menu = await Menu.findOne({ date: menuDate });
    if (!menu) {
      menu = new Menu({ date: menuDate, breakfast: [], lunch: [], dinner: [] });
    }
    const invalidItems = items.filter(item => !item.name || !item.description || !item.calories);
    if (invalidItems.length > 0) {
      return res.status(400).json({ message: "Each item must have name, description, and calories" });
    }
    menu[mealType] = menu[mealType].concat(items.map(item => ({ ...item, rating: 1 })));
    await menu.save();
    await invalidateCache(`menu:${menuDate.toLocaleDateString('en-GB')}`);
    res.status(201).json({ message: "Items added successfully", menu });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMenu = async (req, res) => {
  try {
    let { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required in dd/mm/yyyy format" });
    }
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: "Invalid date format. Use dd/mm/yyyy" });
    }
    const [day, month, year] = date.split('/').map(Number);
    const formattedDate = new Date(year, month - 1, day);
    formattedDate.setHours(0, 0, 0, 0);
    const cachedMenu = await getCachedData(`menu:${date}`);
    if (cachedMenu) {
      console.log("Serving from cache");
      return res.status(200).json(cachedMenu);
    }
    const menu = await Menu.findOne({ date: formattedDate });
    if (!menu) {
      return res.status(404).json({ message: `No menu found for ${date}` });
    }
    await cacheData(`menu:${date}`, menu);
    res.status(200).json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const rateMenuItem = async (req, res) => {
    try {
        const { mealType, itemName, rating } = req.body;
        if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
            return res.status(400).json({ message: "Invalid meal type. Choose 'breakfast', 'lunch', or 'dinner'." });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }
        let menu = await Menu.findOne({ date: new Date().setHours(0, 0, 0, 0) });

        if (!menu) {
            return res.status(404).json({ message: "No menu found for today" });
        }
        let item = menu[mealType].find(i => i.name === itemName);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        item.rating = ((item.rating + rating) / 2).toFixed(1); 
        await menu.save();
        res.status(200).json({ message: "Rating submitted", menu });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const notificationQueue = new Queue('menuNotifications');
const updateMenu = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can update the menu.' });
    }
    const { mealType, date, items } = req.body;
    if (!mealType || !date || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields: mealType, date, or items array" });
    }
    if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
      return res.status(400).json({ message: "Invalid meal type. Choose 'breakfast', 'lunch', or 'dinner'." });
    }
    const menuDate = new Date(date.split('/').reverse().join('-'));
    menuDate.setHours(0, 0, 0, 0);
    if (isNaN(menuDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format. Please provide a valid date (DD/MM/YYYY)." });
    }
    let menu = await Menu.findOne({ date: menuDate });
    if (!menu) {
      return res.status(404).json({ message: "Menu not found for the given date." });
    }
    const invalidItems = items.filter(item => !item.name || !item.description || !item.calories);
    if (invalidItems.length > 0) {
      return res.status(400).json({ message: "Each item must have name, description, and calories" });
    }
    menu[mealType] = items.map(item => ({ ...item, rating: 1 }));
    await menu.save();
    await invalidateCache(`menu:${menuDate.toLocaleDateString('en-GB')}`);
    await notificationQueue.add('menuUpdated', {
      date: date,
      mealType,
      message: `The ${mealType} menu for ${date} has been updated.`,
    });
    res.status(200).json({ message: "Menu updated successfully", menu });
  } catch (error) {
    console.error("Error updating menu:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addMenuItem, getMenu, rateMenuItem, updateMenu };
