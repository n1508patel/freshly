import { useState } from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Slider from "@mui/material/Slider";

const categories = [
  "Fruits & Vegetables",
  "Dairy & Bakery",
  "Beverages",
  "Frozen Foods",
  "Snacks",
  "Electronics",
  "Pharma",
  "Personal Care"
];

const brands = [
  "Samsung", "Nestle", "Mother Dairy", "Redmi", "boAt",
  "Dettol", "Lays", "Maggi", "Amul", "Anveshan",
  "Anker", "Cheetos", 
  "Himalaya", "Bru", 
];

const Sidebar = ({
  selectedCategories, setSelectedCategories,
  selectedAvailability, setSelectedAvailability,
  selectedBrands, setSelectedBrands,
  priceRange, setPriceRange
}) => {

  //  Toggle category
  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  //  Toggle availability
  const toggleAvailability = (val) => {
    setSelectedAvailability(prev =>
      prev.includes(val) ? prev.filter(a => a !== val) : [...prev, val]
    );
  };

  //  Toggle brand
  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  return (
    <div className="sidebar">

      {/* CATEGORIES */}
      <div className="filterBox">
        <h6>PRODUCT CATEGORIES</h6>
        <div className="scroll">
          <FormGroup>
            <ul>
              {categories.map((item, i) => (
                <li key={i}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedCategories.includes(item)}
                        onChange={() => toggleCategory(item)}
                      />
                    }
                    label={item}
                  />
                </li>
              ))}
            </ul>
          </FormGroup>
        </div>
      </div>

      {/* PRICE FILTER */}
      <div className="filterBox">
        <h6>FILTER BY PRICE</h6>
        <Slider
          value={priceRange}
          min={0}
          max={100}
          onChange={(e, v) => setPriceRange(v)}
          valueLabelDisplay="auto"
        />
        <div className="priceRow">
          <span>Price: ${priceRange[0]} — ${priceRange[1]}</span>
        </div>
      </div>

      {/* AVAILABILITY */}
      <div className="filterBox">
        <h6>AVAILABILITY</h6>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedAvailability.includes("inStock")}
                onChange={() => toggleAvailability("inStock")}
              />
            }
            label="In Stock"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedAvailability.includes("onOffer")}
                onChange={() => toggleAvailability("onOffer")}
              />
            }
            label="On Offer"
          />
        </FormGroup>
      </div>

      {/* BRANDS */}
      <div className="filterBox">
        <h6>BRANDS</h6>
        <div className="scroll">
          <FormGroup>
            <ul>
              {brands.map((brand, i) => (
                <li key={i}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                      />
                    }
                    label={brand}
                  />
                </li>
              ))}
            </ul>
          </FormGroup>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;