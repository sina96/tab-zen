import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Popup root element was not found.");
}

app.innerHTML = `
  <section class="shell" aria-labelledby="title">
    <p class="eyebrow">Tab-Zen</p>
    <h1 id="title">Find your tab calm.</h1>
    <p class="summary">
      A local-first extension shell is ready. Live tab insights start in the next stage.
    </p>
  </section>
`;
