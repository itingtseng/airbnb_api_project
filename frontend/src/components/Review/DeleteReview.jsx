import { useModal } from '../../context/Modal';

function DeleteReviewModal({ onConfirm }) {
  const { closeModal } = useModal();

  const handleConfirm = () => {
    onConfirm();
    closeModal(); // Close the modal after confirming
  };

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <h1>Confirm Delete</h1>
        <p>Are you sure you want to delete this review?</p>
        <div className="confirmation-buttons">
          <button
            className="confirm-button"
            onClick={handleConfirm}
          >
            Yes (Delete Review)
          </button>
          <button
            className="cancel-button"
            onClick={closeModal}
          >
            No (Keep Review)
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteReviewModal;
