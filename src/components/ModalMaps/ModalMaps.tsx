import Modal from "../blocks/Modal/Modal";
import styles from "./ModalMaps.module.css";

interface ModalMapsProps {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  fullAddress?: string;
}

export function ModalMaps({ isOpen, onClose, locationName, fullAddress }: ModalMapsProps) {
  if (!isOpen) return null;

  const searchQuery = encodeURIComponent(fullAddress || locationName);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${searchQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  const mapExternalUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Mapa: ${locationName}`}>
      <div className={styles.container}>
        <div className={styles.iframeWrapper}>
          <iframe
            title={`Mapa de ${locationName}`}
            src={mapEmbedUrl}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className={styles.footer}>
          <span className={styles.addressText}>{fullAddress || locationName}</span>
          <a
            href={mapExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalBtn}
          >
            Abrir en Google Maps ↗
          </a>
        </div>
      </div>
    </Modal>
  );
}

export default ModalMaps;
