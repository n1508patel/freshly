import { LuShirt } from "react-icons/lu";
import { TbTruckDelivery } from "react-icons/tb";
import { MdOutlineDiscount } from "react-icons/md";
import { IoPricetagsOutline } from "react-icons/io5";

const footerData = [
  {
    title: "FRUIT & VEGETABLES",
    items: [
      "Fresh Vegetables",
      "Herbs & Seasonings",
      "Fresh Fruits",
      "Cuts & Sprouts",
      "Exotic Fruits & Veggies",
      "Packaged Produce",
      "Party Trays"
    ]
  },
  {
    title: "BREAKFAST & DAIRY",
    items: [
      "Milk & Flavoured Milk",
      "Butter and Margarine",
      "Cheese",
      "Eggs Substitutes",
      "Honey",
      "Marmalades",
      "Sour Cream and Dips",
      "Yogurt"
    ]
  },
  {
    title: "MEAT & SEAFOOD",
    items: [
      "Breakfast Sausage",
      "Dinner Sausage",
      "Beef",
      "Chicken",
      "Sliced Deli Meat",
      "Shrimp",
      "Crab and Shellfish",
      "Farm Raised Fillets"
    ]
  },
  {
    title: "BEVERAGES",
    items: [
      "Water",
      "Sparkling Water",
      "Soda & Pop",
      "Coffee",
      "Milk & Plant-Based Milk",
      "Tea & Kombucha",
      "Drink Boxes & Pouches",
      "Craft Beer",
      "Wine"
    ]
  },
  {
    title: "BREADS & BAKERY",
    items: [
      "Milk & Flavoured Milk",
      "Butter and Margarine",
      "Cheese",
      "Eggs Substitutes",
      "Honey",
      "Marmalades",
      "Sour Cream and Dips",
      "Yogurt"
    ]
  }
];

const Footer = () => {
  return (
    <footer className="footerMain">

      {/* TOP INFO BAR */}
      <div className="footerTop container">
        <div className="infoItem"><LuShirt /> Everyday fresh products</div>
        <div className="infoItem"><TbTruckDelivery /> Free delivery over $70</div>
        <div className="infoItem"><MdOutlineDiscount /> Daily mega discounts</div>
        <div className="infoItem"><IoPricetagsOutline /> Best price guaranteed</div>
      </div>

      {/* FOOTER DATA GRID */}
      <div className="footerLinks container">
        <div className="row g-5">

          {footerData.map((col, i) => (
            <div className="col-md-2 footerCol" key={i}>
              <h6>{col.title}</h6>

              {col.items.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
          ))}

        </div>
      </div>

    </footer>
  );
};

export default Footer;
