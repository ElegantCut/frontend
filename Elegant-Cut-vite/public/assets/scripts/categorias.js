document.querySelectorAll(".category-menu button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".category-menu button")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.dataset.category;
    document.querySelectorAll(".product-card").forEach((card) => {
      card.style.display =
        card.dataset.category === category ? "block" : "none";
    });
  });
});