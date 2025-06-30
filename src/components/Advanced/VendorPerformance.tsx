import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, TrendingDown, Award, AlertCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { VendorPerformance } from '../../types';

export function VendorPerformanceComponent() {
  const { suppliers, purchaseOrders } = useApp();
  const [vendorPerformances, setVendorPerformances] = useState<VendorPerformance[]>([]);

  useEffect(() => {
    calculateVendorPerformance();
  }, [suppliers, purchaseOrders]);

  const calculateVendorPerformance = () => {
    const performances: VendorPerformance[] = suppliers.map(supplier => {
      const supplierPOs = purchaseOrders.filter(po => po.supplierId === supplier.id);
      
      // Calculate on-time delivery rate
      const receivedPOs = supplierPOs.filter(po => po.status === 'received');
      const onTimeDeliveries = receivedPOs.filter(po => {
        const expectedDate = new Date(po.expectedDeliveryDate);
        const receivedDate = new Date(po.updatedAt);
        return receivedDate <= expectedDate;
      });
      const onTimeDeliveryRate = receivedPOs.length > 0 ? (onTimeDeliveries.length / receivedPOs.length) * 100 : 0;

      // Mock quality score and price consistency (in real app, this would come from actual data)
      const qualityScore = 75 + Math.random() * 20; // 75-95%
      const priceConsistency = 80 + Math.random() * 15; // 80-95%

      // Calculate overall score
      const overallScore = (onTimeDeliveryRate * 0.4 + qualityScore * 0.3 + priceConsistency * 0.3);

      return {
        id: supplier.id,
        supplierId: supplier.id,
        onTimeDeliveryRate,
        qualityScore,
        priceConsistency,
        overallScore,
        lastUpdated: new Date().toISOString(),
      };
    });

    setVendorPerformances(performances);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 75) return 'bg-yellow-100 text-yellow-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 90) return <Award className="w-5 h-5 text-green-600" />;
    if (score >= 75) return <TrendingUp className="w-5 h-5 text-yellow-600" />;
    if (score >= 60) return <TrendingDown className="w-5 h-5 text-orange-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  const topPerformers = vendorPerformances
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Performance</h2>
          <p className="text-gray-600 mt-1">Track and evaluate supplier performance metrics</p>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">🏆 Top Performing Vendors</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topPerformers.map((performance, index) => {
            const supplier = suppliers.find(s => s.id === performance.supplierId);
            return (
              <div key={performance.id} className="relative">
                {index === 0 && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                    #1
                  </div>
                )}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-4">
                    {getPerformanceIcon(performance.overallScore)}
                    <h4 className="font-semibold text-gray-900">{supplier?.name}</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Overall Score</span>
                      <span className={`text-sm font-bold ${getScoreColor(performance.overallScore)}`}>
                        {performance.overallScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">On-Time Delivery</span>
                      <span className="text-sm font-medium">
                        {performance.onTimeDeliveryRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Quality Score</span>
                      <span className="text-sm font-medium">
                        {performance.qualityScore.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Performance Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Vendor Scorecard</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  On-Time Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price Consistency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendorPerformances
                .sort((a, b) => b.overallScore - a.overallScore)
                .map((performance) => {
                  const supplier = suppliers.find(s => s.id === performance.supplierId);
                  const totalOrders = purchaseOrders.filter(po => po.supplierId === performance.supplierId).length;
                  
                  return (
                    <tr key={performance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {supplier?.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{supplier?.name}</div>
                            <div className="text-sm text-gray-500">{supplier?.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getPerformanceIcon(performance.overallScore)}
                          <span className={`text-sm font-bold ${getScoreColor(performance.overallScore)}`}>
                            {performance.overallScore.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${performance.onTimeDeliveryRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">
                            {performance.onTimeDeliveryRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {performance.qualityScore.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {performance.priceConsistency.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {totalOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBadge(performance.overallScore)}`}>
                          {performance.overallScore >= 90 ? 'Excellent' :
                           performance.overallScore >= 75 ? 'Good' :
                           performance.overallScore >= 60 ? 'Average' : 'Poor'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {vendorPerformances.length === 0 && (
          <div className="text-center py-12">
            <Star className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No vendor data available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Vendor performance will be calculated once you have purchase orders.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}