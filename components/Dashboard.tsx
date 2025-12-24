import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { FileCheck, AlertTriangle, Calendar, Building2, Quote, CheckCircle2, AlertOctagon, Zap, Factory, TrendingUp } from 'lucide-react';
import { ESGReport } from '../types';

interface DashboardProps {
  report: ESGReport;
  onReset: () => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ report, onReset }) => {
  const lineItems = report.line_items || [];
  
  // Prepare chart data
  const dataByCategory = lineItems.reduce((acc, item) => {
    const existing = acc.find(x => x.name === item.category);
    if (existing) {
      existing.value += (item.carbon_emission_kg || 0);
    } else {
      acc.push({ name: item.category, value: (item.carbon_emission_kg || 0) });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const totalEmissions = report.total_carbon_emission_kg || 0;

  // Derived Insights
  const sortedItems = [...lineItems].sort((a, b) => (b.carbon_emission_kg || 0) - (a.carbon_emission_kg || 0));
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
      
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-slate-400" />
            {report.company_name || "Unknown Company"}
          </h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{report.invoice_date || "Unknown Date"}</span>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getConfidenceColor(report.confidence_score)}`}>
              {report.confidence_score === 'High' ? <CheckCircle2 className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
              Confidence: {report.confidence_score}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 mb-1">Total Carbon Impact</p>
          <div className="text-4xl font-extrabold text-emerald-600 tracking-tight flex items-baseline justify-end gap-1">
            {totalEmissions.toFixed(2)}
            <span className="text-lg text-emerald-600/70 font-medium">kg CO₂e</span>
          </div>
        </div>
      </div>

      {/* Key Insights Cards */}
      {lineItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
               <p className="text-sm text-slate-500">{(dominantCategory?.value / totalEmissions * 100).toFixed(0)}% of total</p>
             </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
             <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
               <Factory className="w-5 h-5" />
             </div>
             <div>
               <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Items Processed</p>
               <p className="font-bold text-slate-800 mt-1">{lineItems.length} Line Items</p>
               <p className="text-sm text-slate-500">Scope 3 Data Points</p>
             </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      {lineItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
             <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
               <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
               Emission Sources
             </h3>
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

          {/* Bar Chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
              Intensity by Item
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lineItems.filter(i => (i.carbon_emission_kg || 0) > 0).slice(0, 8)}>
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

      {/* Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            Extracted Line Items (Audit Trail)
          </h3>
          <span className="text-xs text-slate-400">Scope 3 Calculation</span>
        </div>
        
        {lineItems.length === 0 ? (
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
                  <th className="px-6 py-4">Quantity / Unit</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Emission Factor</th>
                  <th className="px-6 py-4 text-right">Total CO₂ (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <tr className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-800">{item.item}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {item.quantity} <span className="text-xs text-slate-400 uppercase ml-1">{item.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${item.category.toLowerCase().includes('energy') ? 'bg-orange-100 text-orange-800' : 
                            item.category.toLowerCase().includes('raw') ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {item.emission_factor ?? '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-700">
                        {item.carbon_emission_kg?.toFixed(2) ?? '-'}
                      </td>
                    </tr>
                    {/* Evidence Row - Revealed on hover or always visible usually better for audit */}
                    <tr className="bg-slate-50/40">
                       <td colSpan={5} className="px-6 py-2 border-b border-slate-100">
                          <div className="flex items-start gap-2 text-xs text-slate-500 italic">
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

      <div className="flex justify-center pt-8">
        <button 
          onClick={onReset}
          className="px-6 py-3 rounded-lg bg-white border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
        >
          Analyze Another Invoice
        </button>
      </div>
    </div>
  );
};

export default Dashboard;