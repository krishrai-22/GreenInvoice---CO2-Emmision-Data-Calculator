import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  ArrowRight, TrendingUp, TrendingDown, Scale, Building2, Calendar, 
  FileCheck, AlertTriangle, Quote, CheckCircle2, AlertOctagon, Zap, Factory 
} from 'lucide-react';
import { ESGReport } from '../types';

interface ComparisonDashboardProps {
  reports: ESGReport[];
  onReset: () => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ reports, onReset }) => {
  const [reportA, reportB] = reports;
  const [activeTab, setActiveTab] = useState<0 | 1>(0);

  const totalA = reportA.total_carbon_emission_kg || 0;
  const totalB = reportB.total_carbon_emission_kg || 0;
  const diff = totalB - totalA;
  const percentChange = totalA === 0 ? 0 : ((diff / totalA) * 100);

  // Prepare Comparative Data by Category
  const allCategories = Array.from(new Set([
    ...(reportA.line_items || []).map(i => i.category),
    ...(reportB.line_items || []).map(i => i.category)
  ]));

  const chartData = allCategories.map(cat => {
    const valA = reportA.line_items?.filter(i => i.category === cat).reduce((sum, i) => sum + (i.carbon_emission_kg || 0), 0) || 0;
    const valB = reportB.line_items?.filter(i => i.category === cat).reduce((sum, i) => sum + (i.carbon_emission_kg || 0), 0) || 0;
    return {
      category: cat,
      file1: valA,
      file2: valB,
    };
  });

  // --- Logic for Detailed View (Active Tab) ---
  const activeReport = reports[activeTab];
  const activeLineItems = activeReport.line_items || [];
  const activeTotal = activeReport.total_carbon_emission_kg || 0;
  
  // Prepare individual chart data
  const dataByCategory = activeLineItems.reduce((acc, item) => {
    const existing = acc.find(x => x.name === item.category);
    if (existing) {
      existing.value += (item.carbon_emission_kg || 0);
    } else {
      acc.push({ name: item.category, value: (item.carbon_emission_kg || 0) });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const sortedItems = [...activeLineItems].sort((a, b) => (b.carbon_emission_kg || 0) - (a.carbon_emission_kg || 0));
  const topEmitter = sortedItems.length > 0 ? sortedItems[0] : null;
  const dominantCategory = dataByCategory.sort((a,b) => b.value - a.value)[0];

  const getConfidenceColor = (score: string) => {
    switch (score.toLowerCase()) {
      case 'high': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* --- Section 1: Comparison Overview --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card A */}
        <div 
          onClick={() => setActiveTab(0)}
          className={`cursor-pointer p-6 rounded-xl border shadow-sm relative overflow-hidden transition-all ${activeTab === 0 ? 'bg-white ring-2 ring-emerald-500 border-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-emerald-300'}`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Building2 className="w-16 h-16" />
          </div>
          <p className="text-sm text-slate-500 font-medium mb-1">Baseline Invoice</p>
          <h3 className="text-xl font-bold text-slate-800 truncate" title={reportA.company_name}>{reportA.company_name || 'Document 1'}</h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 mb-4"><Calendar className="w-3 h-3" /> {reportA.invoice_date || 'N/A'}</p>
          <div className="text-3xl font-bold text-slate-700">
            {totalA.toFixed(1)} <span className="text-sm text-slate-400 font-normal">kg CO₂</span>
          </div>
        </div>

        {/* Delta Card */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200">
           <div className={`p-3 rounded-full mb-3 ${diff > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
             {diff > 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
           </div>
           <p className="text-sm text-slate-500 font-medium">Net Difference</p>
           <div className={`text-2xl font-bold ${diff > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
             {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
           </div>
           <p className="text-xs text-slate-400 mt-1">
             {Math.abs(percentChange).toFixed(1)}% {diff > 0 ? 'Increase' : 'Decrease'}
           </p>
        </div>

        {/* Card B */}
        <div 
          onClick={() => setActiveTab(1)}
          className={`cursor-pointer p-6 rounded-xl border shadow-sm relative overflow-hidden transition-all ${activeTab === 1 ? 'bg-white ring-2 ring-emerald-500 border-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-emerald-300'}`}
        >
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <Building2 className="w-16 h-16" />
          </div>
          <p className="text-sm text-slate-500 font-medium mb-1">Comparison Invoice</p>
          <h3 className="text-xl font-bold text-slate-800 truncate" title={reportB.company_name}>{reportB.company_name || 'Document 2'}</h3>
           <p className="text-xs text-slate-400 flex items-center gap-1 mb-4"><Calendar className="w-3 h-3" /> {reportB.invoice_date || 'N/A'}</p>
          <div className="text-3xl font-bold text-slate-700">
            {totalB.toFixed(1)} <span className="text-sm text-slate-400 font-normal">kg CO₂</span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            Emissions by Category Comparison
          </h3>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="category" tick={{fontSize: 12}} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <RechartsTooltip 
                 cursor={{fill: '#f1f5f9'}}
                 contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Legend />
              <Bar dataKey="file1" fill="#94a3b8" radius={[4, 4, 0, 0]} name={reportA.company_name || 'Baseline'} />
              <Bar dataKey="file2" fill="#10b981" radius={[4, 4, 0, 0]} name={reportB.company_name || 'Comparison'} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-emerald-900 text-white rounded-xl shadow-lg p-6 md:p-8">
        <h3 className="text-lg font-semibold mb-4 text-emerald-100">Comparative Insights</h3>
        <p className="text-emerald-200/80 mb-4">
           The cumulative carbon footprint is <span className="text-white font-bold">{(totalA + totalB).toFixed(2)} kg CO₂</span>. 
           {diff > 0 
             ? ` The comparison document shows a ${Math.abs(percentChange).toFixed(1)}% increase in emissions compared to baseline.` 
             : ` The comparison document shows a ${Math.abs(percentChange).toFixed(1)}% reduction in emissions compared to baseline.`
           }
        </p>
      </div>

      {/* --- Section 2: Individual Deep Dive --- */}
      <div className="pt-8 border-t border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Building2 className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Detailed Report Breakdown</h2>
            <p className="text-sm text-slate-500">Analyzing: <span className="font-semibold text-emerald-600">{activeReport.company_name}</span></p>
          </div>
        </div>

        {/* Deep Dive: Key Insights */}
        {activeLineItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex items-start gap-4">
               <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                 <TrendingUp className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Top Contributor</p>
                 <p className="font-bold text-slate-800 mt-1 line-clamp-1" title={topEmitter?.item}>{topEmitter?.item || "N/A"}</p>
                 <p className="text-sm text-slate-500">{topEmitter?.carbon_emission_kg?.toFixed(1)} kg CO₂</p>
               </div>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 flex items-start gap-4">
               <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                 <Zap className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Dominant Category</p>
                 <p className="font-bold text-slate-800 mt-1">{dominantCategory?.name || "N/A"}</p>
                 <p className="text-sm text-slate-500">{(dominantCategory?.value / activeTotal * 100).toFixed(0)}% of total</p>
               </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
               <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                 <Factory className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Items Processed</p>
                 <p className="font-bold text-slate-800 mt-1">{activeLineItems.length} Line Items</p>
                 <p className="text-sm text-slate-500">Scope 3 Data Points</p>
               </div>
            </div>
          </div>
        )}

        {/* Deep Dive: Charts */}
        {activeLineItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
               <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Emission Sources</h3>
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={dataByCategory}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       fill="#8884d8"
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {dataByCategory.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <RechartsTooltip formatter={(value: number) => `${value.toFixed(2)} kg CO₂`} />
                     <Legend verticalAlign="bottom" height={36} iconType="circle" />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Top 5 Intense Items</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeLineItems.filter(i => (i.carbon_emission_kg || 0) > 0).slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="item" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{fontSize: 10}} />
                    <RechartsTooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="carbon_emission_kg" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Deep Dive: Audit Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Extracted Line Items ({activeReport.company_name})
            </h3>
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getConfidenceColor(activeReport.confidence_score)}`}>
              {activeReport.confidence_score === 'High' ? <CheckCircle2 className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
              Confidence: {activeReport.confidence_score}
            </div>
          </div>
          
          {activeLineItems.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <AlertOctagon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>No carbon-relevant line items found in this document.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">CO₂ (kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeLineItems.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <tr className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {item.item}
                          <div className="block md:hidden text-xs text-slate-400 mt-1 italic">"{item.evidence_text}"</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {item.quantity} <span className="text-xs text-slate-400 uppercase">{item.unit}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                            ${item.category.toLowerCase().includes('energy') ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' : 
                              item.category.toLowerCase().includes('raw') ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-700">
                          {item.carbon_emission_kg?.toFixed(2) ?? '-'}
                        </td>
                      </tr>
                      {/* Desktop only evidence row for cleaner look */}
                      <tr className="hidden md:table-row bg-slate-50/40">
                         <td colSpan={4} className="px-6 py-1 border-b border-slate-100">
                            <div className="flex items-start gap-2 text-[10px] text-slate-400 italic">
                              <Quote className="w-3 h-3 text-slate-300 shrink-0 mt-0.5" />
                              Evidence: "{item.evidence_text}"
                            </div>
                         </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={onReset}
          className="px-6 py-3 rounded-lg bg-white border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
        >
          Analyze New Files
        </button>
      </div>
    </div>
  );
};

export default ComparisonDashboard;