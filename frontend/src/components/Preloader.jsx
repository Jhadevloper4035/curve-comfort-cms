import logoDark from '@/assets/images/logo-dark.png';

const Preloader = () => (
  <div className="app-preloader" role="status" aria-label="Loading">
    <div className="app-preloader-content">
      <img src={logoDark} alt="Curve Comfort" className="app-preloader-logo" />
      <div className="preloader-progress-bar">
        <div className="progress-value" />
      </div>
    </div>
  </div>
);

export default Preloader;
