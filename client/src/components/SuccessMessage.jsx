const SuccessMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      style={{
        padding: '15px',
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb',
        borderRadius: '4px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#155724',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 10px',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SuccessMessage;
