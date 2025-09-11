export const Modal = ({ children, title, icon, onclick }) => {
    return <div className="modal-overlay" onClick={onclick}>
        <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="icon">
                    {icon}
                </span>
                <h2 className="title">{title}</h2>
            </div>
            <div className="modal-content">{children}</div>
        </div>
    </div>;
};
