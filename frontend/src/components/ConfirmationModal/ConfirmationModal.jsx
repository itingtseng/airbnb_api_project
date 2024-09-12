import { useModal } from '../../context/Modal';
import './Confirmation.css';

function ConfirmationModal({ onConfirm }) {
  const { closeModal } = useModal();

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <h1>Confirm Delete</h1>
        <p>Are you sure you want to remove this spot?</p>
        <div className="confirmation-buttons">
          <button
            className="confirm-button"
            onClick={handleConfirm}
          >
            Yes (Delete Spot)
          </button>
          <button
            className="cancel-button"
            onClick={closeModal}
          >
            No (Keep Spot)
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
