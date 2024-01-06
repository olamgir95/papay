const assert = require("assert");
const Member = require("../models/Member");
const Product = require("../models/Product");
const Definer = require("../lib/mistake");
const Restaurant = require("../models/Restaurant");

let restaurantController = module.exports;

restaurantController.getRestaurants = async (req, res) => {
  try {
    console.log(`GET: cont/getRestaurants `);
    const data = req.query,
      restaurant = new Restaurant(),
      result = await restaurant.getRestaurantData(req.member, data);

    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR, cont/getRestaurants,    ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

restaurantController.getChosenRestaurant = async (req, res) => {
  try {
    console.log(`GET: cont/getChosenRestaurant `);
    const product = new Restaurant(),
      id = req.params.id,
      result = await product.getChosenRestaurantData(req.member, id);

    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR, cont/getChosenRestaurant,    ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

/**********************************
 *  BSSR RELATED METHODS          *
 **********************************/

restaurantController.home = async (req, res) => {
  try {
    console.log(`GET: cont/home`);

    res.render("home-page");
  } catch (err) {
    console.log(`ERROR, cont/home, ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

restaurantController.getMyRestaurantProducts = async (req, res) => {
  try {
    console.log(`GET: cont/getMyRestaurantProducts`);
    const product = new Product();
    const data = await product.getAllProductsDataResto(req.session.member);
    res.render("restaurant-menu", { restaurant_data: data });
    console.log("data", data);
  } catch (err) {
    console.log(`ERROR, cont/getMyRestaurantProducts, ${err.message}`);
    res.redirect("/resto");
  }
};

restaurantController.getSignupMyRestaurant = async (req, res) => {
  try {
    console.log(`GET: cont/getSignupMyRestaurant`);
    res.render("signup");
  } catch (err) {
    console.log(`ERROR, cont/getSignupMyRestaurant, ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

restaurantController.signupProcess = async (req, res) => {
  try {
    console.log(`POST: cont/signupProcess`);

    assert(req.file, Definer.general_err3);

    let new_member = req.body;
    new_member.mb_type = "RESTAURANT";
    new_member.mb_image = req.file.path.replace(/\\/g, "/");

    const member = new Member();
    result = await member.signupData(new_member);
    assert(result, Definer.general_err1);

    req.session.member = result;
    req.session.save(function () {
      res.redirect("/resto/products/menu");
    });
  } catch (err) {
    console.log(`ERROR, cont/signup, ${err.message}`);
    res.send(
      ` <script>alert("${err.message}"); window.location.replace('/resto/sign-up');</script>
    `
    );
  }
};

restaurantController.getLoginMyRestaurant = async (req, res) => {
  try {
    console.log(`GET: cont/LoginMyRestaurant`);
    res.render("login-page");
  } catch (err) {
    console.log(`ERROR, cont/login, ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

restaurantController.loginProcess = async (req, res) => {
  try {
    console.log(`POST: cont/loginProcess`);
    const data = req.body,
      member = new Member(),
      result = await member.loginData(data);

    req.session.member = result;
    req.session.save(function () {
      result.mb_type === "ADMIN"
        ? res.redirect("/resto/all-restaurant")
        : res.redirect("/resto/products/menu");
    });
  } catch (err) {
    console.log(`ERROR, cont/login, ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

restaurantController.logout = (req, res) => {
  try {
    console.log("GET cont.logout");
    req.session.destroy(function () {
      res.redirect("/resto");
    });
  } catch (err) {
    console.log(`ERROR, cont/login, ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

restaurantController.validateAuthRestaurant = (req, res, next) => {
  if (req.session?.member?.mb_type === "RESTAURANT") {
    req.member = req.session.member;
    console.log("req", req.member);
    next();
  } else
    res.json({
      state: "fail",
      message: "only authenticated members with restaurant type",
    });
};

restaurantController.checkSessions = (req, res) => {
  if (req.session?.member) {
    res.json({ state: "success", data: req.session.member });
  } else {
    res.json({ state: "fail", message: "You are not authenticated" });
  }
};

restaurantController.validateAdmin = (req, res, next) => {
  if (req.session?.member?.mb_type === "ADMIN") {
    req.member = req.session.member;
    next();
  } else {
    const html = `<script>alert("Admin page: Permission denied!");
    window.location.replace="/resto";
    </script>`;
    res.end(html);
  }
};

restaurantController.getAllRestaurants = async (req, res) => {
  try {
    console.log("GET cont/getAllRestaurants");
    const restaurant = new Restaurant();
    const restaurant_data = await restaurant.getAllRestaurantsData();
    res.render("all-restaurants", { restaurant_data: restaurant_data });
  } catch (err) {
    console.log(`ERROR, cont/getAllRestaurants, ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

restaurantController.updateRestaurantByAdmin = async (req, res) => {
  try {
    console.log("GET cont/getAllRestaurants");
    const restaurant = new Restaurant();
    const result = await restaurant.updateRestaurantByAdminData(req.body);
    await res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR, cont/getAllRestaurants, ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};
