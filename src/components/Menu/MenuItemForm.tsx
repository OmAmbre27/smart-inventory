import React, { useState } from 'react';
import { ArrowLeft, ChefHat, Plus, Minus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleSheets } from '../../contexts/GoogleSheetsContext';

interface MenuItemFormProps {
  onBack: () => void;
}

interface Ingredient {
  productId: string;
  quantity: number;
  unit: string;
}

export function MenuItemForm({ onBack }: MenuItemFormProps) {
  const { products, addMenuItem } = useApp();
  const { user } = useAuth();
  const { updateSheet } = useGoogleSheets();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    costPerPlate: '',
    isActive: true,
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { productId: '', quantity: 0, unit: 'kg' }
  ]);

  const addIngredient = () => {
    setIngredients(prev => [...prev, { productId: '', quantity: 0, unit: 'kg' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    setIngredients(prev => prev.map((ingredient, i) => 
      i === index ? { ...ingredient, [field]: value } : ingredient
    ));
  };

  const calculateCost = () => {
    return ingredients.reduce((total, ingredient) => {
      const product = products.find(p => p.id === ingredient.productId);
      // Mock cost calculation - in real app, this would use actual product costs
      const estimatedCostPerUnit = 5; // $5 per kg/l average
      return total + (ingredient.quantity * estimatedCostPerUnit);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const validIngredients = ingredients.filter(ing => ing.productId && ing.quantity > 0);
    if (validIngredients.length === 0) {
      alert('Please add at least one ingredient');
      return;
    }

    const menuItem = {
      name: formData.name,
      ingredients: validIngredients,
      costPerPlate: parseFloat(formData.costPerPlate) || calculateCost(),
      category: formData.category,
      isActive: formData.isActive,
      createdBy: user.id,
    };

    addMenuItem(menuItem);

    // Update Google Sheets
    try {
      const sheetData = validIngredients.map(ingredient => {
        const product = products.find(p => p.id === ingredient.productId);
        return {
          'Dish Name': formData.name,
          'Ingredient': product?.name || '',
          'Quantity': ingredient.quantity,
          'Unit': ingredient.unit,
          'Cost Per Plate': menuItem.costPerPlate,
          'Category': formData.category,
        };
      });
      
      await updateSheet('menu', sheetData);
    } catch (error) {
      console.error('Failed to update Google Sheets:', error);
    }

    onBack();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <ChefHat className="w-6 h-6 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Add Menu Item</h2>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dish Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter dish name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                <option value="Appetizers">Appetizers</option>
                <option value="Main Course">Main Course</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
                <option value="Sides">Sides</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost Per Plate ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.costPerPlate}
                onChange={(e) => setFormData(prev => ({ ...prev, costPerPlate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={`Auto-calculated: $${calculateCost().toFixed(2)}`}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Active Menu Item
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Ingredients *</label>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center space-x-2 text-orange-600 hover:text-orange-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Ingredient</span>
              </button>
            </div>

            <div className="space-y-4">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl">
                  <div className="flex-1">
                    <select
                      value={ingredient.productId}
                      onChange={(e) => updateIngredient(index, 'productId', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select ingredient</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-24">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Qty"
                      required
                    />
                  </div>

                  <div className="w-20">
                    <select
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="l">l</option>
                      <option value="ml">ml</option>
                      <option value="pieces">pcs</option>
                    </select>
                  </div>

                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Estimated Cost:</span>
              <span className="text-2xl font-bold text-orange-600">${calculateCost().toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all"
            >
              Add Menu Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}