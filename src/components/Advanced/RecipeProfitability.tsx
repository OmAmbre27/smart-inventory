import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calculator, Edit } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/currency';
import { MenuItem } from '../../types';

interface ProfitabilityData {
  menuItemId: string;
  dishName: string;
  costPerPlate: number;
  sellingPrice: number;
  grossProfit: number;
  profitMargin: number;
  volume: number;
  totalRevenue: number;
  totalProfit: number;
}

export function RecipeProfitability() {
  const { menuItems, manualOrders, products, updateMenuItem } = useApp();
  const [profitabilityData, setProfitabilityData] = useState<ProfitabilityData[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  useEffect(() => {
    calculateProfitability();
  }, [menuItems, manualOrders]);

  const calculateProfitability = () => {
    const data: ProfitabilityData[] = menuItems.map(item => {
      // Calculate actual cost per plate based on current ingredient prices
      const actualCost = item.ingredients.reduce((total, ingredient) => {
        const product = products.find(p => p.id === ingredient.productId);
        // Use a mock price if no purchase price available
        const avgPrice = 50; // ₹50 per kg/l average
        return total + (ingredient.quantity * avgPrice);
      }, 0);

      const sellingPrice = item.sellingPrice || item.costPerPlate * 2; // Default 100% markup
      const grossProfit = sellingPrice - actualCost;
      const profitMargin = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;

      // Calculate volume from manual orders
      const volume = manualOrders.reduce((total, order) => {
        const orderItem = order.items.find(oi => oi.menuItemId === item.id);
        return total + (orderItem?.quantity || 0);
      }, 0);

      const totalRevenue = volume * sellingPrice;
      const totalProfit = volume * grossProfit;

      return {
        menuItemId: item.id,
        dishName: item.name,
        costPerPlate: actualCost,
        sellingPrice,
        grossProfit,
        profitMargin,
        volume,
        totalRevenue,
        totalProfit,
      };
    });

    setProfitabilityData(data.sort((a, b) => b.profitMargin - a.profitMargin));
  };

  const handlePriceUpdate = (menuItemId: string) => {
    const newPrice = parseFloat(editPrice);
    if (newPrice > 0) {
      // In a real app, this would update the menu item
      console.log(`Updating price for ${menuItemId} to ₹${newPrice}`);
      setEditingItem(null);
      setEditPrice('');
      // Recalculate after update
      calculateProfitability();
    }
  };

  const getProfitabilityColor = (margin: number) => {
    if (margin >= 50) return 'text-green-600';
    if (margin >= 30) return 'text-yellow-600';
    if (margin >= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProfitabilityBadge = (margin: number) => {
    if (margin >= 50) return 'bg-green-100 text-green-800';
    if (margin >= 30) return 'bg-yellow-100 text-yellow-800';
    if (margin >= 10) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const totalRevenue = profitabilityData.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalProfit = profitabilityData.reduce((sum, item) => sum + item.totalProfit, 0);
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recipe Profitability</h2>
          <p className="text-gray-600 mt-1">Analyze dish costs, pricing, and profit margins</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Profit</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalProfit)}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Overall Margin</p>
              <p className={`text-2xl font-bold ${getProfitabilityColor(overallMargin)}`}>
                {overallMargin.toFixed(1)}%
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-xl">
              <Calculator className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Menu Items</p>
              <p className="text-2xl font-bold text-gray-900">{profitabilityData.length}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <Calculator className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Profitability Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Dish Profitability Analysis</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dish Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost/Plate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Selling Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margin %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {profitabilityData.map((item) => (
                <tr key={item.menuItemId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.dishName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{formatCurrency(item.costPerPlate)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingItem === item.menuItemId ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Price"
                        />
                        <button
                          onClick={() => handlePriceUpdate(item.menuItemId)}
                          className="text-green-600 hover:text-green-800"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(null);
                            setEditPrice('');
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-900">{formatCurrency(item.sellingPrice)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      item.grossProfit > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(item.grossProfit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {item.profitMargin > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProfitabilityBadge(item.profitMargin)}`}>
                        {item.profitMargin.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{item.volume} plates</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      item.totalProfit > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(item.totalProfit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditingItem(item.menuItemId);
                        setEditPrice(item.sellingPrice.toString());
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                      title="Edit Selling Price"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {profitabilityData.length === 0 && (
          <div className="text-center py-12">
            <Calculator className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No menu items found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add menu items to analyze profitability.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}