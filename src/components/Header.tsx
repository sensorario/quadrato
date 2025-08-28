import HelpIcon from "./HelpIcon";

export const Header = ({ setShowHelp }) => (
    <h1 className="title-with-help">
        To do list
        <span
            className="help-icon"
            title="Shortcut info"
            onClick={() => setShowHelp(true)}
        >
            <HelpIcon />
        </span>
    </h1>
);