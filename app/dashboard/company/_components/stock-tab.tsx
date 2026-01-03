"use client";

import { useState, useEffect } from "react";
import { useCompany } from "@/app/_contexts/company-context";
import {
  getCompanyProducts,
  getLowStockProducts,
} from "@/app/_actions/company-product";
import { getCompanyStockStats } from "@/app/_actions/company-product/stock-stats";
import ProductManager from "../stock/_components/product-manager";
import {
  Package,
  AlertTriangle,
  Plus,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";

interface Product {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  salePrice: number;
  margin: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface StockTabProps {
  companyId: string;
  onAddProduct: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function StockTab({ companyId, onAddProduct }: StockTabProps) {
  const company = useCompany();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockStats, setStockStats] = useState<any>(null);

  useEffect(() => {
    if (companyId) {
      loadProducts();
    }
  }, [companyId]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const [productsResult, lowStockResult, statsResult] = await Promise.all([
        getCompanyProducts(companyId),
        getLowStockProducts(companyId),
        getCompanyStockStats(companyId),
      ]);

      if (productsResult.success) {
        setProducts(productsResult.data || []);
      }

      if (lowStockResult.success) {
        setLowStockProducts(lowStockResult.data || []);
      }

      if (statsResult.success) {
        setStockStats(statsResult.data);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
    } else {
      setEditingProduct(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    loadProducts();
  };

  const isLowStock = (product: Product) => {
    return product.quantity <= product.minQuantity;
  };

  // Calcular dias parados
  const getDaysStopped = (product: Product) => {
    const now = new Date();
    const updatedAt = new Date(product.updatedAt);
    const days = Math.floor(
      (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    return days;
  };

  return (
    <div className="space-y-4">
      {/* Cards de Resumo do Estoque */}
      {stockStats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor em Estoque
              </CardTitle>
              <Package className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stockStats.totalCostValue)}
              </div>
              <p className="text-muted-foreground text-xs">
                {formatCurrency(stockStats.totalSaleValue)} em vendas potenciais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Produtos
              </CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stockStats.totalProducts}
              </div>
              <p className="text-muted-foreground text-xs">
                {stockStats.productsWithLowStock} com estoque baixo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Margem Média
              </CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stockStats.averageMargin.toFixed(1)}%
              </div>
              <p className="text-muted-foreground text-xs">
                Lucro médio por produto
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas de Estoque Baixo */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-orange-200 bg-white p-3"
                >
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-muted-foreground text-sm">
                      Quantidade: {product.quantity} / Mínimo:{" "}
                      {product.minQuantity}
                    </p>
                  </div>
                  <Badge variant="destructive">Estoque Baixo</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Produtos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Produtos em Estoque</CardTitle>
          <Button onClick={() => handleOpenForm()} className="gap-2" size="sm">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Carregando...
            </p>
          ) : products.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border-2 border-dashed p-8 text-center">
              <p className="mb-2">Nenhum produto cadastrado</p>
              <p className="text-xs">Clique em "Novo Produto" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => {
                const daysStopped = getDaysStopped(product);
                const isStopped = daysStopped > 30 && product.quantity > 0;

                return (
                  <div
                    key={product.id}
                    className={`rounded-lg border p-4 ${
                      isLowStock(product)
                        ? "border-orange-200 bg-orange-50"
                        : ""
                    } ${isStopped ? "border-yellow-200 bg-yellow-50" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          {isLowStock(product) && (
                            <Badge variant="destructive" className="text-xs">
                              Estoque Baixo
                            </Badge>
                          )}
                          {isStopped && (
                            <Badge
                              variant="outline"
                              className="border-yellow-500 text-xs text-yellow-700"
                            >
                              {daysStopped} dias parado
                            </Badge>
                          )}
                          {!product.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Quantidade
                            </p>
                            <p className="font-semibold">{product.quantity}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Custo
                            </p>
                            <p className="font-semibold">
                              {formatCurrency(product.costPrice)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Venda
                            </p>
                            <p className="font-semibold">
                              {formatCurrency(product.salePrice)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Margem
                            </p>
                            <p className="font-semibold text-green-600">
                              {product.margin.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Valor Total
                            </p>
                            <p className="font-semibold">
                              {formatCurrency(
                                product.quantity * product.costPrice,
                              )}
                            </p>
                          </div>
                        </div>
                        {product.description && (
                          <p className="text-muted-foreground mt-2 text-xs">
                            {product.description}
                          </p>
                        )}
                        {isStopped && (
                          <p className="mt-2 text-xs text-yellow-700">
                            ⚠️ Este produto está parado há {daysStopped} dias.
                            Considere promoções ou ajustes.
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenForm(product)}
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gerenciador de Produtos */}
      <ProductManager
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        companyId={companyId}
        onSuccess={loadProducts}
        editingProduct={editingProduct}
      />
    </div>
  );
}
