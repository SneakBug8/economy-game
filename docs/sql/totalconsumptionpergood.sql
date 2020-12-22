select goodId, name, sum(price * amount) from CalculatedPrices
inner join Goods on goodId = Goods.id
where type = 0
group by goodId;