"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompany } from "@/app/_contexts/company-context";
import {
  getCompanyProducts,
  getLowStockProducts,
} from "@/app/_actions/company-product";
import ProductManager from "./_components/product-manager";
import { Building2, Package, AlertTriangle, Plus } from "lucide-react";
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
}

export default function CompanyStockPage() {
  const router = useRouter();
  const company = useCompany();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Bloquear acesso se não tiver estoque habilitado
    if (company && !company.hasStock) {
      router.push("/dashboard/company");
      return;
    }

    if (company && company.hasStock) {
      loadProducts();
    }
  }, [company, router]);

  const loadProducts = async () => {
    if (!company) return;

    setIsLoading(true);
    try {
      const [productsResult, lowStockResult] = await Promise.all([
        getCompanyProducts(company.companyId),
        getLowStockProducts(company.companyId),
      ]);

      if (productsResult.success) {
        setProducts(productsResult.data || []);
      }

      if (lowStockResult.success) {
        setLowStockProducts(lowStockResult.data || []);
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
  };

  // Se não tiver empresa ou estoque não habilitado, não renderizar
  if (!company || !company.hasStock) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const isLowStock = (product: Product) => {
    return product.quantity <= product.minQuantity;
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="text-primary h-6 w-6" />
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Controle de Estoque
              </h1>
            </div>
            <Button onClick={() => handleOpenForm()} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            {company.companyName} - Gestão de produtos e estoque
          </p>
        </div>

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
          <CardHeader>
            <CardTitle>Produtos em Estoque</CardTitle>
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
              <div className="space-y-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      isLowStock(product)
                        ? "border-orange-200 bg-orange-50"
                        : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        {isLowStock(product) && (
                          <Badge variant="destructive" className="text-xs">
                            Estoque Baixo
                          </Badge>
                        )}
                        {!product.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Quantidade
                          </p>
                          <p className="font-semibold">{product.quantity}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Custo</p>
                          <p className="font-semibold">
                            {formatCurrency(product.costPrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Venda</p>
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
                      </div>
                      {product.description && (
                        <p className="text-muted-foreground mt-2 text-xs">
                          {product.description}
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gerenciador de Produtos */}
        <ProductManager
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          companyId={company.companyId}
          onSuccess={loadProducts}
          editingProduct={editingProduct}
        />
      </div>
    </div>
  );
}
