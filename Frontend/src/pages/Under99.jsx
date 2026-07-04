import { useMemo, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { flattenProducts } from '../utils/flattenProducts';
import { ProductContext } from '../context/ProductContext';
import './ProductCategory.css';

const resolveProductPrice = (product) => {
  const variant = product?.variants?.[0];
  const size = variant?.sizes?.[0];
  const raw = size?.price ?? variant?.price ?? product?.price ?? 0;
  const numeric = Number(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function Under99() {
  const { products: allProducts, loading } = useContext(ProductContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const under99Products = useMemo(() => {
    const pricedProducts = allProducts.filter((product) => resolveProductPrice(product) > 0 && resolveProductPrice(product) <= 99);
    if (pricedProducts.length > 0) {
      return pricedProducts.slice(0, 12);
    }

    return [...allProducts]
      .sort((a, b) => resolveProductPrice(a) - resolveProductPrice(b))
      .slice(0, 8);
  }, [allProducts]);

  const expandedProducts = useMemo(() => {
    return flattenProducts(under99Products).map((product) => ({
      ...product,
      displayId: product.displayId || product.id,
      price: typeof product.price === 'number' ? product.price : (Number(product.price) || 0),
      oldPrice: product.oldPrice ? (typeof product.oldPrice === 'number' ? product.oldPrice : (Number(product.oldPrice) || 0)) : null,
    }));
  }, [under99Products]);

  return (
    <div className="category-page">
      <Header hideSubHeader={false} hideSaleRibbon={false} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>Loading products...</div>
      ) : (
        <>
          <section className="category-hero under99-hero">
            <div className="hero-bg">
              <img src="/ABCDE.png" alt="Under ₹99" />
              <div className="hero-overlay" />
            </div>
          </section>

          <main className="category-main container">
            <div className="category-controls">
              <div className="products-count">
                Showing <span>{expandedProducts.length}</span> products
              </div>
            </div>

            <div className="products-grid-wrapper">
              {expandedProducts.length > 0 ? (
                <div className="products-grid">
                  {expandedProducts.map((displayProduct) => (
                    <ProductCard key={displayProduct.displayId} product={displayProduct} showStatusTags={true} />
                  ))}
                </div>
              ) : (
                <div className="no-products">
                  <h3>No products found</h3>
                  <p>Check back soon for more affordable picks.</p>
                </div>
              )}
            </div>
          </main>
        </>
      )}

      <Footer />
    </div>
  );
}
