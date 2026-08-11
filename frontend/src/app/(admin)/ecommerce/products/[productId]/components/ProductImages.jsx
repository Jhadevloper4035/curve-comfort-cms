import { productDisplay } from '@/helpers/productDisplay';

const ProductImages = ({ product }) => {
  const item = productDisplay(product);
  const gallery = [...new Set((product.images?.length ? product.images : product.applicationImage) || [])];

  if (!item.image && gallery.length === 0) return null;

  return (
    <div>
      {item.image && (
        <div className="text-center mb-3">
          <img
            src={item.image}
            alt={item.title}
            className="img-fluid rounded"
            style={{ maxHeight: 360, objectFit: 'contain' }}
          />
        </div>
      )}

      {gallery.length > 0 && (
        <div>
          <p className="text-muted fs-13 mb-2 fw-medium">Gallery</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {gallery.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`${item.title} ${idx + 1}`}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImages;
