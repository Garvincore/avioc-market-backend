import axios from 'axios';

// Render backend base URL (switch to your Render subdomain in production)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get JWT token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('avioc_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiService = {
  // 1. GET Discover Feed & Marketplace listings
  getListings: async () => {
    try {
      const response = await axios.get(`${API_URL}/listings`);
      return response.data;
    } catch (err) {
      console.error('Error in api.getListings:', err);
      throw err;
    }
  },

  // 2. AUTHENTICATION (Split into Buyer User vs. Seller Shop)
  registerUser: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register/user`, userData);
    if (response.data.token) {
      localStorage.setItem('avioc_token', response.data.token);
      localStorage.setItem('avioc_role', 'user');
      localStorage.setItem('avioc_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  registerSeller: async (sellerData) => {
    const response = await axios.post(`${API_URL}/auth/register/seller`, sellerData);
    if (response.data.token) {
      localStorage.setItem('avioc_token', response.data.token);
      localStorage.setItem('avioc_role', 'seller');
      localStorage.setItem('avioc_seller', JSON.stringify(response.data.shop));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('avioc_token', response.data.token);
      localStorage.setItem('avioc_role', response.data.role);
      
      if (response.data.role === 'user') {
        localStorage.setItem('avioc_user', JSON.stringify(response.data.user));
        localStorage.removeItem('avioc_seller');
      } else {
        localStorage.setItem('avioc_seller', JSON.stringify(response.data.shop));
        localStorage.removeItem('avioc_user');
      }
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('avioc_token');
    localStorage.removeItem('avioc_role');
    localStorage.removeItem('avioc_user');
    localStorage.removeItem('avioc_seller');
  },

  // 3. SECURE BUNNY STREAM & LISTING UPLOADS (Double-Hop Flow)
  publishListing: async (listingData, videoFile) => {
    try {
      const prepareRes = await axios.get(`${API_URL}/listings/bunny/prepare-upload`, {
        params: { title: listingData.title },
        headers: getAuthHeaders()
      });

      const { bunnyVideoId, libraryId, uploadSignature } = prepareRes.data;

      await axios.put(
        `https://video.bunnycdn.com/library/${libraryId}/videos/${bunnyVideoId}`,
        videoFile,
        {
          headers: {
            AccessKey: uploadSignature,
            'Content-Type': videoFile.type || 'video/mp4'
          }
        }
      );

      const saveListingRes = await axios.post(
        `${API_URL}/listings`,
        {
          ...listingData,
          bunnyVideoId
        },
        { headers: getAuthHeaders() }
      );

      return saveListingRes.data;
    } catch (err) {
      console.error('Failure publishing listing and video:', err);
      throw err;
    }
  },

  deleteListing: async (listingId) => {
    try {
      const response = await axios.delete(`${API_URL}/listings/${listingId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (err) {
      console.error('Failed to delete listing:', err);
      throw err;
    }
  },

  // 4. MOBILE MONEY TRANSACTIONS & ORDER LOGGING
  chargeMobileMoney: async (paymentData) => {
    try {
      const response = await axios.post(`${API_URL}/payments/momo`, paymentData);
      return response.data;
    } catch (err) {
      console.error('Mobile money payment charge failed:', err);
      throw err;
    }
  },

  logOrder: async (orderData) => {
    // orderData: { shopId, listingId, buyerName, buyerPhone, quantity, totalAmount }
    try {
      const response = await axios.post(`${API_URL}/payments/orders`, orderData);
      return response.data;
    } catch (err) {
      console.error('Failed to log database order:', err);
      throw err;
    }
  },

  getShopOrders: async () => {
    try {
      const response = await axios.get(`${API_URL}/payments/orders`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (err) {
      console.error('Failed to fetch shop orders:', err);
      throw err;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axios.put(`${API_URL}/payments/orders/${orderId}`, { status }, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (err) {
      console.error('Failed to update order status:', err);
      throw err;
    }
  }
};
