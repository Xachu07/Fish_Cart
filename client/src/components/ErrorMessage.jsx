const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      style={{
        padding: '15px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb',
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
            color: '#721c24',
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

export default ErrorMessage;
