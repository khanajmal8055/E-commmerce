import asyncHandler from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiErrror.js'
import {ApiResponse} from '../utils/apiResponse.js'

import {User} from '../Models/user.models.js'
import { Order } from '../Models/order.models.js'


const userKPI = asyncHandler(async(req,res)=> {
    const result = await User.aggregate([
        {
            $facet : {
                // total user count
                totalUser : [
                    {$group: {_id : null , count : {$sum : 1}}}
                ],

                todayRegistrations : [
                    {
                        $match : {
                            createdAt : {
                                $gte : new Date(new Date().setHours(0,0,0,0)),
                                $lte : new Date(new Date().setHours(23,59,59,999))
                            }
                        }
                    },
                    {$group : {_id : null , count:{$sum : 1}}}
                ],
                
                weeklyRegistratons : [
                    {
                        $match : {
                            createdAt : {
                                $gte : new Date(new Date().setDate(new Date().getDate()-7))
                            }
                        }
                    },
                    {$group : {_id : null , count:{$sum : 1}}}
                ],

                monthlyRegistration : [
                    {
                        $match : {
                            createdAt : {
                                $gte : new Date(new Date().getFullYear(), new Date().getMonth() , 1)
                            }
                        }
                    },
                    {$group : {_id : null , count:{$sum : 1}}}
                ],
                userWithActiveSession : [
                    {
                        $match : {
                            refreshToken : {$exists : true , $ne : null , $ne:""}
                        }
                    },
                    {$group : {_id : null , count:{$sum : 1}}}
                ]

            }
        }
    ])

    const stats = result[0]

    return res.status(200)
    .json(
        new ApiResponse(
            200,
             {
                totalUser : stats.totalUser[0]?.count || 0,
                todayRegistrations : stats.todayRegistrations[0]?.count || 0,
                weeklyRegistratons : stats.weeklyRegistratons[0]?.count || 0 ,
                monthlyRegistration : stats.monthlyRegistration[0]?.count || 0,
                userWithActiveSession : stats.userWithActiveSession[0]?.count || 0
            },
            "User data fetched Successfully"
        )
    )
})

const orderKPI = asyncHandler(async(req,res)=> {
    const result = await Order.aggregate([
        {
            $facet : {
                totalOrders : [
                    {$group : {_id : null , count : {$sum :1}}}
                ],
               
                totalRevenue : [
                    {
                        $match:{orderStatus : 'DELIVERED'}
                    },
                    {$group : {_id: null , total : {$sum : "$finalAmount"}}}
                ],
                orderByStatus : [
                    {
                        $group : {_id : '$orderStatus' , count : {$sum : 1}}
                    }
                ],

                todayOrder : [
                    {
                        $match : {
                            createdAt : {
                                $gte : new Date(new Date().setHours(0,0,0,0)),
                                $lte : new Date(new Date().setHours(23,59,59,999))
                            }
                        }
                    },
                    {$group : {_id : null , count:{$sum : 1}}}
                ],
                weeklyOrder : [
                    {
                        $match : {
                            createdAt : {
                                $gte : new Date(new Date().setDate(new Date().getDate()-7))
                            }
                        }
                    },
                    {$group : {_id : null , count:{$sum : 1}}}
                ],
                monthlyOrder : [
                    {
                        $match : {
                            createdAt : {
                                $gte : new Date(new Date().getFullYear(), new Date().getMonth() , 1)
                            }
                        }
                    },
                    {$group : {_id : null , count:{$sum : 1}}}
                ]
            }
        }
    ]) 

    const stats = result[0]

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalOrders : stats.totalOrders[0]?.count || 0,
                totalRevenue : stats.totalRevenue[0]?.total || 0,
                orderByStatus : (stats.orderByStatus || []).reduce((acc,curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}), 
                todayOrder : stats.todayOrder[0]?.count || 0,
                weeklyOrder : stats.weeklyOrder[0]?.count || 0,
                monthlyOrder : stats.monthlyOrder[0]?.count || 0
            },
            "Order fetched Successfully"
        )
    )
})

const topSellingProduct = asyncHandler(async(req,res)=> {
    const result = await Order.aggregate([
        {
            $unwind: "$items"
        },
        {
            $group : {_id:'$items.product' , totalSold:{$sum : '$items.quantity'}}
        },
        // {
        //     $match:{orderStatus : 'CANCELED'}
        // },
        {
            $lookup : {
                from : 'products',
                localField : '_id',
                foreignField : '_id',
                as : "product"
            }
        },
        {
            $unwind : '$product'
        },
        {
            $project : {
                _id : 0,
                poductId : '$product._id',
                name : "$product.name",
                image: { $arrayElemAt: ["$product.images.url", 0] },
                totalSold : 1
            }
        },
        {$sort:{totalSold:-1}},
        {$limit : 10}
    ])

    const stats = result[0]

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                count: result.length,
                topProducts : result
            },
            "Top selling order fetched Successfully"
        )
    )
})

export {userKPI , orderKPI ,topSellingProduct}