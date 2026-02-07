import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  costPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  date: Date;
}

export const useInventory = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time products listener
  useEffect(() => {
    console.log('useInventory: Current user:', user?.uid);
    
    if (!user) {
      console.log('useInventory: No user, clearing products');
      setProducts([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'products'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('useInventory: Got', snapshot.docs.length, 'products from Firebase');
      const productsList = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('useInventory: Product data:', data);
        return {
          id: doc.id,
          name: data.name,
          sku: data.sku,
          category: data.category,
          quantity: data.quantity,
          minStock: data.minStock,
          price: data.price,
          costPrice: data.costPrice,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Product;
      });
      // Sort by createdAt descending (newest first) - client-side to avoid Firebase index requirement
      productsList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setProducts(productsList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching products:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Real-time sales listener
  useEffect(() => {
    if (!user) {
      setSales([]);
      return;
    }

    const q = query(
      collection(db, 'sales'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const salesList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          productId: data.productId,
          productName: data.productName,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          totalAmount: data.totalAmount,
          date: data.date?.toDate() || new Date(),
        } as Sale;
      });
      // Sort by date descending (newest first) - client-side to avoid Firebase index requirement
      salesList.sort((a, b) => b.date.getTime() - a.date.getTime());
      setSales(salesList);
    }, (error) => {
      console.error('Error fetching sales:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const addProduct = useCallback(
    async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) return null;

      try {
        const docRef = await addDoc(collection(db, 'products'), {
          userId: user.uid,
          name: product.name,
          sku: product.sku,
          category: product.category,
          quantity: product.quantity,
          minStock: product.minStock,
          price: product.price,
          costPrice: product.costPrice,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        return { id: docRef.id };
      } catch (error) {
        console.error('Error adding product:', error);
        return null;
      }
    },
    [user]
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
      if (!user) return;

      try {
        const docRef = doc(db, 'products', id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: Timestamp.now(),
        });
      } catch (error) {
        console.error('Error updating product:', error);
      }
    },
    [user]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    },
    [user]
  );

  const recordSale = useCallback(
    async (productId: string, quantity: number) => {
      if (!user) return null;

      const product = products.find((p) => p.id === productId);
      if (!product || product.quantity < quantity) return null;

      try {
        const totalAmount = product.price * quantity;
        
        const docRef = await addDoc(collection(db, 'sales'), {
          userId: user.uid,
          productId,
          productName: product.name,
          quantity,
          unitPrice: product.price,
          totalAmount,
          date: Timestamp.now(),
        });

        // Update product quantity
        await updateProduct(productId, { quantity: product.quantity - quantity });

        return {
          id: docRef.id,
          productId,
          productName: product.name,
          quantity,
          unitPrice: product.price,
          totalAmount,
          date: new Date(),
        };
      } catch (error) {
        console.error('Error recording sale:', error);
        return null;
      }
    },
    [user, products, updateProduct]
  );

  const getLowStockProducts = useCallback(() => {
    return products.filter((p) => p.quantity <= p.minStock && p.quantity > 0);
  }, [products]);

  const getOutOfStockProducts = useCallback(() => {
    return products.filter((p) => p.quantity === 0);
  }, [products]);

  const getTotalInventoryValue = useCallback(() => {
    return products.reduce((sum, p) => sum + p.quantity * p.costPrice, 0);
  }, [products]);

  const getTotalSalesValue = useCallback(() => {
    return sales.reduce((sum, s) => sum + s.totalAmount, 0);
  }, [sales]);

  return {
    products,
    sales,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    recordSale,
    getLowStockProducts,
    getOutOfStockProducts,
    getTotalInventoryValue,
    getTotalSalesValue,
  };
};
