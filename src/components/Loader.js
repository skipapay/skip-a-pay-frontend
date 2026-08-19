import Spinner from "react-bootstrap/Spinner";

// ==============================|| Loader ||============================== //

const Loader = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      background: "rgba(255, 255, 255, 0.6)",
      backdropFilter: "blur(4px)",
      height: "100%",
      width: "100%",
      display: "grid",
      placeItems: "center",
      zIndex: 9999,
    }}
  >
    <Spinner
      animation="border"
      style={{
        width: "3rem",
        height: "3rem",
        color: "var(--primary, #030359)",
        borderWidth: "0.25em",
      }}
    />
  </div>
);

export default Loader;
