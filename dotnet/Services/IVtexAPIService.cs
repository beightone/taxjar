﻿using System.Threading.Tasks;
using Taxjar.Models;

namespace Taxjar.Services
{
    public interface IVtexAPIService
    {
        Task<TaxForOrder> VtexRequestToTaxjarRequest(VtexTaxRequest vtexTaxRequest);
        Task<VtexTaxResponse> TaxjarResponseToVtexResponse(TaxResponse taxResponse);
        Task<VtexOrder> GetOrderInformation(string orderId);
        Task<string> InitConfiguration();
        Task<string> RemoveConfiguration();
        Task<CreateTaxjarOrder> VtexOrderToTaxjarOrder(VtexOrder vtexOrder);
        Task<VtexDockResponse[]> ListVtexDocks();
        Task<TaxFallbackResponse> GetFallbackRate(string country, string postalCode, string provider = "avalara");
        Task<bool> ProcessNotification(AllStatesNotification allStatesNotification);
        Task<PickupPoints> ListPickupPoints();
        Task<string> GetShopperIdByEmail(string email);
        Task<string> GetShopperEmailById(string userId);
        Task<NexusRegionsResponse> NexusRegions();
        Task<CreateTaxjarOrder> VtexPackageToTaxjarRefund(VtexOrder vtexOrder, Package package);
    }
}