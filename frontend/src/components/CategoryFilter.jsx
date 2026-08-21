function CategoryFilter({
  categories = [],
  selectedCategory = "ALL",
  onCategoryChange,
}) {
  return (
    <div className="category-filter-container" role="tablist" aria-label="Filter cakes and bakes by category">
      <button
        type="button"
        role="tab"
        aria-selected={selectedCategory === "ALL"}
        className={`category-pill-btn ${
          selectedCategory === "ALL" ? "active" : ""
        }`}
        onClick={() => onCategoryChange("ALL")}
      >
        ✨ All Delights
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          role="tab"
          aria-selected={selectedCategory === category.id}
          className={`category-pill-btn ${
            selectedCategory === category.id ? "active" : ""
          }`}
          onClick={() => onCategoryChange(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;