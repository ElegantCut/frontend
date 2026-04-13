import '../../styles/AdminHeader.css';

const AdminHeader = ({ toggleSidebar }) => {
  return (
    <header className="admin-header py-2 px-4 d-flex justify-content-between align-items-center bg-white border-bottom sticky-top">
      <div className="header-left d-flex align-items-center">
        <button className="btn-toggle-sidebar d-md-none me-3 border-0 bg-transparent text-dark" onClick={toggleSidebar}>
          <i className="bi bi-list fs-2"></i>
        </button>
        <div className="d-none d-md-flex align-items-center gap-2">
          <i className="bi bi-scissors text-danger fs-4"></i>
          <span className="fw-bold text-muted small text-uppercase" style={{letterSpacing: '0.5px'}}>Elegant Cut Admin</span>
        </div>
      </div>
      <div className="header-right">
        <div className="d-flex align-items-center gap-2">
          <div className="text-end d-none d-sm-block">
            <div className="fw-bold small" style={{fontSize: '0.85rem'}}>Administrador</div>
            <div className="text-muted" style={{fontSize: '0.7rem'}}>Panel Central</div>
          </div>
          <img
            src="https://ui-avatars.com/api/?name=Admin&background=bc2041&color=fff&rounded=true"
            alt="Admin"
            className="rounded-circle border"
            width="32"
            height="32"
          />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;