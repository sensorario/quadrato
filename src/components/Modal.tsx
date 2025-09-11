export const Modal = ({ children, title, icon }) => {
    const onClickHandler = (e) => {
        e.stopPropagation();
    };

    return <div className="modal-overlay">
        <div className="modal" onClick={onClickHandler}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="icon">
                    {icon}
                </span>
                <h2 className="title">{title}</h2>
            </div>
            <div className="content">{children}</div>
        </div>
    </div>;
};
