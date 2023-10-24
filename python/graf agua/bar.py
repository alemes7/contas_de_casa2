import matplotlib.pyplot as plt

# Dados de exemplo
meses = ["Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro"]
valores = [61.21, 125.60, 166.61, 115.92, 145.37, 153.94, 100.86, 196.44]

# Gráfico de Barras
plt.figure(figsize=(10, 5))
plt.bar(meses, valores, color='dodgerblue')
plt.title("Contas de Água por Mês")
plt.xlabel("Mês")
plt.ylabel("Valor (R$)")
plt.xticks(rotation=45)
plt.show()

# Gráfico de Pizza
plt.figure(figsize=(7, 7))
plt.pie(valores, labels=meses, autopct='%1.1f%%', startangle=140)
plt.title("Distribuição de Contas de Água por Mês")
plt.show()

# Gráfico de Linha
plt.figure(figsize=(10, 5))
plt.plot(meses, valores, marker='o', linestyle='-')
plt.title("Evolução das Contas de Água por Mês")
plt.xlabel("Mês")
plt.ylabel("Valor (R$)")
plt.grid(True)
plt.show()
